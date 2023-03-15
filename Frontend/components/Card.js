import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import { CardActionArea } from '@mui/material';
import Grid from '@mui/material/Grid';

import styles from "./tag.module.css"

export default function ImgMediaCard({ metadata, curr }) {
    return (
        <Grid
            container
            spacing={4}
            className={styles.gridContainer}
            justify="center"
        >
            {
                metadata.map((nft) => (
                    <Grid item xs={12} sm={4} md={4} key={nft.tokenId}>
                        <Card className={styles.root} variant="outlined" key={nft.nft.attributes[2].value}>
                            <CardActionArea href={`/player-details/${nft.tokenId}`}>
                                <CardMedia
                                    component="img"
                                    alt={nft.nft.name}
                                    height="350vp"
                                    image={nft.nft.image.replace("ipfs://", "https://ipfs.io/ipfs/")}
                                    className={curr != nft.tokenId ? styles.sold : ""}
                                />
                                {nft.tokenId < curr
                                    ? <div className={styles.image_over}><img className={styles.icon_img} src="/sold.png" /></div>
                                    : nft.tokenId > curr
                                        ? <div className={styles.image_over}><img className={styles.icon_img} src="/soon.png" /></div>
                                        : <></>
                                }
                                <div className={styles.overlay}>
                                    {nft.nft.name}
                                </div>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))
            }
        </Grid>
    );
}


