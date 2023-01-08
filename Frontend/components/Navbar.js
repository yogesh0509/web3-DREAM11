import { ConnectButton, useNotification } from "web3uikit"
import { useState } from 'react';
import { useWeb3Contract } from "react-moralis";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';

const ContractAbi = require("../constants/ContractAbi.json")

function Navbar() {
    const [anchorElNav, setAnchorElNav] = useState(null);
    const abi = JSON.parse(ContractAbi["Marketplace"])
    const MarketplaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS

    const dispatch = useNotification();

    const handleSuccessNotification = () => {
        dispatch({
            type: "success",
            message: "Transaction Complete!",
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

    const { runContractFunction: register,
        isLoading,
        isFetching, } = useWeb3Contract({
            abi: abi,
            contractAddress: MarketplaceAddress,
            functionName: "register",
            params: {}
        })

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleRegistrations = async () => {
        await register({
            onSuccess: async (tx) => {
                await tx.wait(1);
                handleSuccessNotification();
            },
            onError: async (err) => {
                console.log(err)
                handleErrorNotification();
            }
        })
        setAnchorElNav(null);
    }

    return (
        <AppBar position="static" color="">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        LOGO
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            <MenuItem onClick={handleRegistrations}>
                                <Typography textAlign="center">Register</Typography>
                            </MenuItem>

                            <MenuItem onClick={handleCloseNavMenu}>
                                <Typography textAlign="center">Players Sold</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                    <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href=""
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        LOGO
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            <Button
                                onClick={handleRegistrations}
                                sx={{ mx: 1, my: 2, color: 'black', display: 'block' }}
                            >
                                Register
                            </Button>

                            <Button
                                onClick={handleCloseNavMenu}
                                sx={{ mx: 1, my: 2, color: 'black', display: 'block' }}
                            >
                                Players Sold
                            </Button>
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <ConnectButton moralisAuth={false} />
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default Navbar;

