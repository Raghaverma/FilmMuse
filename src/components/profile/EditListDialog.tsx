"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EditListDialogProps {
  list: { id: string; name: string; description?: string };
  open: boolean;
  onClose: () => void;
  onUpdate: (listId: string, name: string, description?: string) => void;
}

export default function EditListDialog({ list, open, onClose, onUpdate }: EditListDialogProps) {
  const [name, setName] = React.useState(list.name);
  const [description, setDescription] = React.useState(list.description || "");

  React.useEffect(() => {
    setName(list.name);
    setDescription(list.description || "");
  }, [list]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdate(list.id, name.trim(), description.trim() || undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0b0b0d] text-neutral-100 border-white/10">
        <DialogHeader>
          <DialogTitle>Edit List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">List Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-emerald-400 text-black hover:bg-emerald-300">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

