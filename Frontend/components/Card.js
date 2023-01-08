import { makeStyles } from "@material-ui/core/styles";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { CardActionArea } from '@mui/material';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

const useStyles = makeStyles({
    root: {
        minWidth: 200
    },
    gridContainer: {
        paddingLeft: "40px",
        paddingRight: "40px"
    },
    nft: {
        opacity: "30%"
    }

});

export default function ImgMediaCard({ metadata }) {
    const classes = useStyles();

    return (
        <Grid
            container
            spacing={4}
            className={classes.gridContainer}
            justify="center"
        >
            {
                metadata.map((nft) => (
                    // ${disabled == nft.tokenId ? classes.nft : ""}
                    <Grid item xs={12} sm={4} md={3}>
                        <Card className={`${classes.root} `} variant="outlined" key={nft.nft.attributes[2].value}>
                            <CardActionArea href={`/player-details/${nft.tokenId}`}>
                                <CardMedia
                                    component="img"
                                    alt={nft.nft.name}
                                    height="250"
                                    image={nft.nft.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
                                    // className={disabled == nft.tokenId ? classes.nft : ""}
                                />
                                <CardContent>
                                    <Typography gutterBottom variant="h5" component="div">
                                        {nft.nft.name}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))
            }
        </Grid>
    );
}


