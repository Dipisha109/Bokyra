import { useState } from "react";

function WishlistButton() {
    const [isWishlisted, setIsWishlisted] = useState(false);

    function handleWishlist() {
        setIsWishlisted(!isWishlisted);
    }

    return (
        <button onClick={handleWishlist}>
            {isWishlisted ? "♥ Added to Wishlist" : "♡ Add to Wishlist"}
        </button>
    );
}

export default WishlistButton;