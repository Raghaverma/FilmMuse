import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Share2, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovieGrid from "./MovieGrid";

interface CustomList {
  id: string;
  name: string;
  description?: string;
  movies: Array<{ id: string; title: string; year?: number; poster?: string | null }>;
  sharedWith?: string[];
  isPublic?: boolean;
}

interface ListsTabProps {
  lists: CustomList[];
  onCreateClick: () => void;
  onEditClick: (listId: string) => void;
  onDeleteClick: (listId: string, listName: string) => void;
  onShareClick: (list: CustomList) => void;
  onUpdate: () => void;
}

export default function ListsTab({
  lists,
  onCreateClick,
  onEditClick,
  onDeleteClick,
  onShareClick,
  onUpdate,
}: ListsTabProps) {
  return (
    <motion.div
      key="lists"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {lists.length === 0 ? (
        <div className="text-center py-8">
          <Film className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-sm text-neutral-400 mb-4">You haven&apos;t created any custom lists yet.</p>
          <Button
            onClick={onCreateClick}
            className="bg-emerald-400 text-black hover:bg-emerald-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First List
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {lists.map((list) => (
            <div key={list.id} className="border border-white/10 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-lg">{list.name}</h3>
                  {list.description && (
                    <p className="text-sm text-neutral-400 mt-1">{list.description}</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-1">{list.movies.length} movies</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onShareClick(list)}
                    className="p-2 hover:bg-white/10 rounded"
                    title="Share list"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEditClick(list.id)}
                    className="p-2 hover:bg-white/10 rounded"
                    title="Edit list"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteClick(list.id, list.name)}
                    className="p-2 hover:bg-red-500/20 rounded text-red-400"
                    title="Delete list"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {list.movies.length === 0 ? (
                <p className="text-sm text-neutral-400 py-4">This list is empty.</p>
              ) : (
                <MovieGrid movies={list.movies} onUpdate={onUpdate} />
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

