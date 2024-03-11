  // ConfirmTransactionPopup.jsx
  import { useState } from 'react';
  import React from 'react';
  import Dialog from '@mui/material/Dialog';
  import DialogActions from '@mui/material/DialogActions';
  import DialogContent from '@mui/material/DialogContent';
  import DialogContentText from '@mui/material/DialogContentText';
  import DialogTitle from '@mui/material/DialogTitle';
  import Table from '@mui/material/Table';
  import TableBody from '@mui/material/TableBody';
  import TableCell from '@mui/material/TableCell';
  import TableContainer from '@mui/material/TableContainer';
  import TableRow from '@mui/material/TableRow';
  import Button from '@mui/material/Button';
  import Backdrop from '@mui/material/Backdrop';
  import { styled } from '@mui/system';
  import Divider from '@mui/material/Divider';
  import IconButton from '@mui/material/IconButton';
  import FileCopyIcon from '@mui/icons-material/FileCopy';
  import Snackbar from '@mui/material/Snackbar';
  import MuiAlert from '@mui/material/Alert';
  import { useWallet } from './WalletContext';
  import jsonItemsData from '../blockaroodata/ItemsNFT';
  import { useEffect } from 'react';

  const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(3px)',
  }));

  const ConfirmLoginPopup = ({ open, handleClose, handleConfirm }) => {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <p>Logged In to Buy Now. Do you want to proceed?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const ConfirmTransactionPopup = ({ token, from, to, image, amount, open, handleClose, handleConfirm}) => {

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const { walletAddress, walletState, deductFunds } = useWallet();
    const [transactionHistory, setTransactionHistory] = useState([]);

    useEffect(() => {
      // Load transaction history from local storage on component mount
      const storedTransactionHistory = JSON.parse(sessionStorage.getItem('transactionHistory')) || [];
      setTransactionHistory(storedTransactionHistory);
    }, []);

    const getCurrentFormattedDateTime = () => {
      const dateOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
    
      const timeOptions = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      };
    
      const currentDateTime = new Date();
      const formattedDate = currentDateTime.toLocaleDateString('en-US', dateOptions);
      const formattedTime = currentDateTime.toLocaleTimeString('en-US', timeOptions);
    
      return `${formattedDate} ${formattedTime}`;
    };

    
    const handleFunds = (amount, token) => {
      if (walletState.balance >= amount) {
          deductFunds(amount);
          console.log('New Balance:', walletState.balance);
          setSnackbarSeverity('success');
          setSnackbarMessage('Transaction confirmed successfully');
          const objectToModify = jsonItemsData.ItemsData.find(item => item.token === token);
          const storedUsername = sessionStorage.getItem('username');

          // Create newTransaction object
          const newTransaction = {
            kind: "ERC721 transfer",
            tokenId: token,
            timestamp: Date.now().toString(),
            from: objectToModify.walletaddress,
            to: walletAddress,
            status: 'success',
            price: objectToModify.price, 
          };

          if (objectToModify) {
            // Modify the specific fields
            objectToModify.onsell = false;
            objectToModify.ownedname = storedUsername;
            objectToModify.walletaddress = {walletAddress};
            setTransactionHistory(prevTransactionHistory => [...prevTransactionHistory, newTransaction]);

            sessionStorage.setItem('transactionHistory', JSON.stringify([...transactionHistory, newTransaction]));

          }

          
          const jsonString = JSON.stringify(jsonItemsData, null, 2);
          console.log(jsonString);
      } else {
        setSnackbarSeverity('error');
        setSnackbarMessage('Insufficient funds for transaction.');
      }
    
      setSnackbarOpen(true);
    };
    

    const handleCopyToken = () => {
      navigator.clipboard.writeText(token);
      setSnackbarSeverity('success');
      setSnackbarMessage('Token copied to clipboard');
      setSnackbarOpen(true);
    };
    

    const handleSnackbarClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setSnackbarOpen(false)
    };

    
    return (
      <>
      <Dialog open={open} onClose={handleClose} BackdropComponent={StyledBackdrop}>
        <DialogTitle sx={{ padding:'20px 0 5px 25px' }}>Confirm Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please review your transaction details.
          </DialogContentText>
        </DialogContent>
        <Divider />
        <DialogContent sx={{ display: 'flex', justifyContent:'center', flexDirection:'column', alignItems: 'center', flexWrap: 'wrap', padding:'10px 10px 5px 10px' }}>
          <img className="itemtransaction" src={image} alt="Item Transaction" loading="lazy"></img>
          <DialogContentText padding='5px'>
            {token ? `0x${token.slice(2, 7)}...${token.slice(-5)}` : 'Token not available'}
            <IconButton onClick={handleCopyToken}>
              <FileCopyIcon sx={{ fontSize: '15px'}} />
            </IconButton>
          </DialogContentText>
          <DialogContentText>
            {amount} ETH
          </DialogContentText>
        </DialogContent>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>From</TableCell>
                <TableCell>{from}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>To</TableCell>
                <TableCell>{to}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>{getCurrentFormattedDateTime()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        <DialogActions>
          <Button onClick={() => { 
              handleClose(); 
            }} color="primary">
              Cancel
            </Button>
          <Button 
              onClick={() => { 
                handleConfirm(); 
                const Amount = parseFloat(amount);
                handleFunds(Amount, token); 
              }} 
              color="primary" 
              variant="contained"
            >
              Confirm
            </Button>
        </DialogActions>
      </Dialog>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000} // Adjust the duration as needed
          onClose={handleSnackbarClose}
        >
          <MuiAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      </>
    );
  };

  export {ConfirmTransactionPopup, ConfirmLoginPopup} ;