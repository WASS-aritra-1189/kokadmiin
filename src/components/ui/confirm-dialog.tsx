import { Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "./dialog";

interface Props {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title = "Delete item",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#FEF2F2]">
            <Trash2 className="h-5 w-5 text-[#EF4444]" />
          </div>
          <DialogTitle className="text-center text-[15px]">{title}</DialogTitle>
          <DialogDescription className="text-center text-[12px]">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 flex gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-9 rounded-md border border-[#E5E7EB] bg-white text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-9 rounded-md bg-[#EF4444] text-[12px] font-medium text-white hover:bg-[#DC2626] disabled:opacity-60"
          >
            {loading ? "Deleting…" : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
