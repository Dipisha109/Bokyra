function BagStatus({inStock}) {
    return(
        <p>
            {inStock?"In Stock":"Sold Out"}
        </p>
    )
}
export default BagStatus;