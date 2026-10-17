const bags=[
    "Tote Bag",
    "Backpack",
    "Messenger Bag",
]

function BagList(){
    return(
        <div>
            {bags.map((bag) => (
                <h2 key={bag}>{bag}</h2>
            ))}
        </div>
    )
}

export default BagList