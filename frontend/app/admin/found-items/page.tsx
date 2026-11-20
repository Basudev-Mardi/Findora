import { AdminItemsManager } from "@/components/admin/AdminItemsManager";

export default function AdminFoundItemsPage() {
  return (
    <AdminItemsManager
      type="found"
      title="Found Items Management"
      description="Manage found campus inventory, adjust item availability statuses, or clean up invalid entries."
    />
  );
}
