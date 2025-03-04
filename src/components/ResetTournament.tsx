import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

function ResetTournamentButton() {
    const [open, setOpen] = useState(false);

    const handleReset = () => {
        localStorage.removeItem("matches");
        localStorage.removeItem("submittedScores");
        localStorage.removeItem("finalMatch");
        window.location.reload();
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
                    Are you sure you want to reset the tournament? This will clear all data.
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
