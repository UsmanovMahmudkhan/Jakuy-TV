'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SavePlaylistDialogProps {
  open: boolean;
  onSave: () => void;
  onSkip: () => void;
}

const SavePlaylistDialog = ({ open, onSave, onSkip }: SavePlaylistDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onSkip()}>
      <DialogContent className="bg-neutral-900 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-white">Save Playlist?</DialogTitle>
          <DialogDescription>
            Do you want to save this playlist for future sessions?
            <br />
            <span className="text-neutral-500 text-xs mt-1">
              This will save your playlist, favorites, and recently watched channels.
            </span>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-3">
          <Button
            onClick={onSkip}
            variant="outline"
            className="flex-1 border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white"
          >
            Skip
          </Button>
          <Button
            onClick={onSave}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SavePlaylistDialog;

