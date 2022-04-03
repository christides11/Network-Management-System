import { Dialog, DialogTitle, FormControl, Modal, Typography } from "@mui/material";
import { Box } from "@mui/system";
import useState from 'react-usestateref';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

function CreateSensorModal({open, handleClose}){

    return (
        <Dialog
        fullWidth={true}
        maxWidth={'sm'}
        open={open}
        onClose={handleClose}>
            <DialogTitle>Add Sensor</DialogTitle>
            <Box
            noValidate
            component="form"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                m: 'auto',
                width: 'fit-content',
              }}
            >
                <FormControl sx={{ mt: 2, minWidth: 120 }}>
                    
                </FormControl>
            </Box>
        </Dialog>
    );
}

export default CreateSensorModal;