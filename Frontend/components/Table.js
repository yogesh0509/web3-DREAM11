import * as React from 'react';
import { ethers } from 'ethers';
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
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

import styles from "./Table.module.css"
const ContractAbi = require("../constants/ContractAbi.json")

function createData(name, calories, fat, carbs, playersBought) {
  let arr = []
  for (let player of playersBought) {
    arr.push({
      date: player[0],
      customerId: `https://testnets.opensea.io/assets/goerli/0xef48a42d3a8f582adb1af16e3ff65b21aa29b0b6/${player[0]}`,
      amount: player[1]
    })
  }
  return {
    name,
    calories,
    fat,
    carbs,
    history: arr,
  };
}

function Row(props) {
  const { account } = useMoralis();
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  const abi = JSON.parse(ContractAbi["AuctionHouse"])
  const abiMarketplace = JSON.parse(ContractAbi["Marketplace"])
  const AuctionHouseAddress = process.env.NEXT_PUBLIC_AUCTIONHOUSE_CONTRACT_ADDRESS
  const MarketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS

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

  const { runContractFunction: withdrawWinnerFunds,
    isLoadingWinner,
    isFetchingWinner, } = useWeb3Contract({
      abi: abiMarketplace,
      contractAddress: MarketplaceAddress,
      functionName: "withdrawWinnerFunds",
      params: {}
    })

  const handleWithdraw = async (event) => {
    let current_account = event.target.parentNode.previousSibling.previousSibling.previousSibling.previousSibling.innerHTML
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

  const handleWinner = async (event) => {
    let current_account = event.target.parentNode.previousSibling.previousSibling.previousSibling.innerHTML
    if (account == current_account.toLowerCase()) {
      await withdrawWinnerFunds({
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
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} className={props.winner == row.name ? styles.winner_row : ""}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          {props.winner == row.name ? <MilitaryTechIcon /> : <div />}
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="right">{row.calories}</TableCell>
        <TableCell align="right">{ethers.utils.formatEther(row.fat, "ether")} ETH</TableCell>
        <TableCell align="right">
          {props.winner == row.name
            ?
            <Button variant="contained" color="success" onClick={handleWinner} disabled={isLoadingWinner || isFetchingWinner}>{ethers.utils.formatEther(props.winnerAmount, "ether")} ETH</Button>
            : <div />}
        </TableCell>
        <TableCell align="right">
          <Button variant="contained" color="error" onClick={handleWithdraw} disabled={isLoading || isFetching}>{ethers.utils.formatEther(row.carbs, "ether")} ETH</Button>
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
                      <TableCell align="right">{ethers.utils.formatEther(historyRow.amount, "ether")} ETH</TableCell>
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
    rows.push(createData(
      props.registrants[i],
      props.numPlayerPurchased[i],
      props.moneyspent[i],
      props.withdrawableAmount[i],
      props.playersBought[i])
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell />
            <TableCell>Registrant</TableCell>
            <TableCell align="right">Number of Players Purshased</TableCell>
            <TableCell align="right">Amount spent</TableCell>
            <TableCell align="right">{props.winner != "0x0000000000000000000000000000000000000000" ? "Winner Amount" : ""}</TableCell>
            <TableCell align="right">Withdrawable amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <Row key={row.name} row={row} winner={props.winner} winnerAmount={props.winnerAmount} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}