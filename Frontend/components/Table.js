import * as React from 'react';
import { useNotification } from "web3uikit"
import { useWeb3Contract, useMoralis } from "react-moralis";
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Button from '@mui/material/Button';

const ContractAbi = require("../constants/ContractAbi.json")

function createData(name, calories, fat, carbs) {
  return {
    name,
    calories,
    fat,
    carbs,
    history: [
      {
        date: '2020-01-05',
        customerId: '11091700',
        amount: 3,
      },
      {
        date: '2020-01-02',
        customerId: 'Anonymous',
        amount: 1,
      },
    ],
  };
}

function Row(props) {
  const { account } = useMoralis();
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  const abi = JSON.parse(ContractAbi["AuctionHouse"])
  const AuctionHouseAddress = process.env.NEXT_PUBLIC_AUCTIONHOUSE_CONTRACT_ADDRESS

  const dispatch = useNotification();

  const handleSuccessNotification = (msg) => {
    dispatch({
      type: "success",
      message: msg,
      title: "Transaction Notification",
      position: "topR",
    })
  }

  const handleErrorNotification = () => {
    dispatch({
      type: "error",
      message: "Error!",
      title: "Error",
      position: "topR",
    })
  }

  const { runContractFunction: withdraw,
    isLoading,
    isFetching, } = useWeb3Contract({
      abi: abi,
      contractAddress: AuctionHouseAddress,
      functionName: "withdraw",
      params: {}
    })

  const handleWithdraw = async (event) => {
    let current_account = event.target.parentNode.previousSibling.previousSibling.previousSibling.innerHTML
    if (account == current_account.toLowerCase()) {
      await withdraw({
        onSuccess: async (tx) => {
          await tx.wait(1);
          handleSuccessNotification("Funds have been transferred!!");
        },
        onError: async (err) => {
          console.log(err)
          handleErrorNotification();
        }
      })
    }
    else {
      console.log("Wrong account")
      handleErrorNotification();
    }
  }

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="right">{row.calories}</TableCell>
        <TableCell align="right">{row.fat}</TableCell>
        <TableCell align="right">
          <Button variant="contained" color="error" onClick={handleWithdraw} disabled={isLoading || isFetching}>{row.carbs}</Button>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Transactions
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Token Id</TableCell>
                    <TableCell>NFT</TableCell>
                    <TableCell align="right">Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.map((historyRow) => (
                    <TableRow key={historyRow.date}>
                      <TableCell component="th" scope="row">
                        {historyRow.date}
                      </TableCell>
                      <TableCell>{historyRow.customerId}</TableCell>
                      <TableCell align="right">{historyRow.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}



export default function CollapsibleTable(props) {
  console.log(props)
  const rows = []
  for (let i = 0; i < props.count; i++) {
    rows.push(createData(props.registrants[i], props.numPlayerPurchased[i], props.moneyspent[i], 0))
  }

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Registrant</TableCell>
            <TableCell align="right">Number of Players Purshased</TableCell>
            <TableCell align="right">Amount spent</TableCell>
            <TableCell align="right">Withdrawable amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.name} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}