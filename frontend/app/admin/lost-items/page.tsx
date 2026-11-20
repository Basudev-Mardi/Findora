import { AdminItemsManager } from "@/components/admin/AdminItemsManager";

export default function AdminLostItemsPage() {
  return (
    <AdminItemsManager
      type="lost"
      title="Lost Items Management"
      description="Review reported lost items, update statuses, or remove duplicate and inappropriate reports."
    />
  );
}
