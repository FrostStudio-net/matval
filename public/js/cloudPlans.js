import { supabase, isSupabaseConfigured } from "./supabaseClient.js";
import { getCurrentUser } from "./auth.js";

const LATEST_PLAN_KEYS = ["matvalLatestPlan", "matval.latestPlan.v1"];

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured.");
  }
  return supabase;
}

function cloudRowToPlan(row) {
  return {
    ...(row.plan_data || {}),
    id: row.id,
    cloudId: row.id,
    source: "cloud",
    title: row.title || row.plan_data?.title || "Matarplan",
    store: row.selected_shop || row.plan_data?.store || row.plan_data?.selectedShop || null,
    totalCost: Number(row.total_price ?? row.plan_data?.totalCost ?? row.plan_data?.totalPrice ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function planToCloudPayload(plan, userId) {
  return {
    user_id: userId,
    title: plan.title || "Matarplan",
    plan_data: plan,
    selected_shop: plan.store || plan.selectedShop || null,
    total_price: Number(plan.totalCost ?? plan.totalPrice ?? 0) || null,
  };
}

export async function savePlanToCloud(plan) {
  const client = requireSupabase();
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("User must be logged in to save cloud plan");
  }

  const payload = planToCloudPayload(plan, user.id);
  const { data, error } = await client
    .from("meal_plans")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Could not save plan:", error);
    throw error;
  }

  return cloudRowToPlan(data);
}

export async function getCloudPlans() {
  const client = requireSupabase();
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await client
    .from("meal_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Could not fetch cloud plans:", error);
    throw error;
  }

  return (data || []).map(cloudRowToPlan);
}

export async function deleteCloudPlan(planId) {
  const client = requireSupabase();
  const { error } = await client.from("meal_plans").delete().eq("id", planId);
  if (error) throw error;
}

export async function updateCloudPlan(planId, updates) {
  const client = requireSupabase();
  const payload = {
    ...(updates.title ? { title: updates.title } : {}),
    ...(updates.plan_data ? { plan_data: updates.plan_data } : {}),
    ...(updates.selected_shop ? { selected_shop: updates.selected_shop } : {}),
    ...(updates.total_price != null ? { total_price: updates.total_price } : {}),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await client
    .from("meal_plans")
    .update(payload)
    .eq("id", planId)
    .select()
    .single();

  if (error) throw error;
  return cloudRowToPlan(data);
}

export async function migrateLatestLocalPlanToCloud() {
  const plan = LATEST_PLAN_KEYS
    .map((key) => {
      try {
        return JSON.parse(localStorage.getItem(key) || "null");
      } catch (_error) {
        return null;
      }
    })
    .find(Boolean);

  if (!plan) return null;
  return savePlanToCloud(plan);
}

window.MatvalCloudPlans = {
  savePlanToCloud,
  getCloudPlans,
  deleteCloudPlan,
  updateCloudPlan,
  migrateLatestLocalPlanToCloud,
  isSupabaseConfigured,
};
