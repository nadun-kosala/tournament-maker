import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { supabase } from "@/lib/supabase";

interface ResetTournamentButtonProps {
  onReset: () => void;
}

function ResetTournamentButton({ onReset }: ResetTournamentButtonProps) {
  const [open, setOpen] = useState(false);

  const handleReset = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const { data: newTournament } = await supabase
      .from('tournaments')
      .insert({
        created_by: user.user.id,
        name: 'New Tournament'
      })
      .select()
      .single();

    if (newTournament) {
      onReset();
      setOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="px-3 py-2 w-full bg-red-500 text-gray-900 rounded-lg hover:bg-red-600"
        onClick={() => setOpen(true)}
      >
        Reset Tournament
      </button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Confirm Reset</DialogTitle>
        <DialogContent>
          Are you sure you want to reset the tournament? This will create a new tournament.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleReset} color="error">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ResetTournamentButton;