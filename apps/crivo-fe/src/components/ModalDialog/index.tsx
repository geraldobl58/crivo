"use client";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";

type ModalDialogProps = {
  open: boolean;
  setOpen?: (open: boolean) => void;
  onClose: () => void;
  title: string;
  content?: React.ReactNode;
};

export const ModalDialog = ({
  open,
  setOpen,
  onClose,
  title,
  content,
}: ModalDialogProps) => {
  return (
    <Dialog onClose={onClose} open={open} fullWidth maxWidth="sm">
      <DialogTitle sx={{ m: 0, p: 2 }}>{title}</DialogTitle>
      <IconButton
        aria-label="close"
        onClick={() => {
          if (setOpen) setOpen(false);
          onClose();
        }}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <X />
      </IconButton>
      <DialogContent dividers className="p-4!">
        {content && content}
      </DialogContent>
    </Dialog>
  );
};
