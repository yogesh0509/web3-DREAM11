import * as React from 'react';
import toast from "react-hot-toast";

import { ethers } from 'ethers';
import { useRouter } from 'next/router'
import Image from "next/image"

import { useAccount } from 'wagmi'
import { prepareWriteContract, readContract, waitForTransaction, writeContract } from "wagmi/actions"

import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Button } from '@mui/material';
import { KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import { MilitaryTech as MilitaryTechIcon } from '@mui/icons-material';

const abi = require("../constants/abi.json")

function createData(name, calories, fat, carbs, playersBought) {
  let arr = []
  for (let player of playersBought) {
    arr.push({
      date: player.player.name,
      customerId: parseInt(player.player.id),
      amount: parseInt(player.price)
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
  const { address } = useAccount()
  const router = useRouter()
  const { query } = router
  const { row } = props
  const [open, setOpen] = React.useState(false)
  const GamecontractABI = JSON.parse(abi["Game"])
  const gameAddress = query.gameAddress

  const handleWithdraw = async (event) => {
    const current_account = event.target.parentNode.previousSibling.previousSibling.previousSibling.previousSibling.innerHTML
    if (address == current_account) {
      toast.dismiss("connecting");
      toast.loading("Connecting with contract", {
        id: "connect",
      });
      try {
        const { request, result } = await prepareWriteContract({
          address: gameAddress,
          abi: GamecontractABI,
          functionName: "withdrawDreamToken",
        });

        const { hash } = await writeContract(request);
        await waitForTransaction({ hash });
        toast.dismiss("connect");
        toast.success("Successfully registered");
        toast.custom("You'll be notified once approved", {
          icon: "ℹ️",
        });

      } catch (err) {
        toast.dismiss("connect");
        console.error(err);
        toast.error("Error connecting with contract");
      }
    }
    else {
      toast.dismiss("Wrong account");
    }
  }

  const handleWinner = async (event) => {
    const current_account = event.target.parentNode.previousSibling.previousSibling.previousSibling.innerHTML
    if (address == current_account) {
      toast.dismiss("connecting");
      toast.loading("Connecting with contract", {
        id: "connect",
      });
      try {
        const { request, result } = await prepareWriteContract({
          address: gameAddress,
          abi: GamecontractABI,
          functionName: "withdrawDreamToken",
        });

        const { hash } = await writeContract(request);
        await waitForTransaction({ hash });
        toast.dismiss("connect");
        toast.success("Successfully registered");
        toast.custom("You'll be notified once approved", {
          icon: "ℹ️",
        });

      } catch (err) {
        toast.dismiss("connect");
        console.error(err);
        toast.error("Error connecting with contract");
      }
    }
    else {
      toast.dismiss("Wrong account");
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
        <TableCell align="right">{row.fat}</TableCell>
        <TableCell align="right">
          {props.winner == row.name
            ?
            <Button variant="contained" color="success" onClick={handleWinner} >{ethers.utils.formatEther(props.winnerAmount, "ether")} ETH</Button>
            : <div />}
        </TableCell>
        <TableCell align="right">
          <Button onClick={handleWithdraw} >
            <Image src="/assets/currency.png" alt="currency" width="200" height={200} className="inline-block w-10 h-10" />
          </Button>
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
                    <TableCell>Player</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell align="right">Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.map((historyRow) => (
                    <TableRow key={historyRow.date}>
                      <TableCell component="th" scope="row">
                        {historyRow.date.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {historyRow.customerId}
                      </TableCell>
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
  const rows = []
  for (let i = 0; i < props.registrants.length; i++) {
    rows.push(createData(
      props.registrants[i],
      props.numPlayerPurchased[i],
      0,
      0,
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
            <TableCell align="right">Team Score</TableCell>
            <TableCell align="right">{props.winner != "0x0000000000000000000000000000000000000000" ? "Winner Amount" : ""}</TableCell>
            <TableCell align="right">Withdraw</TableCell>
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