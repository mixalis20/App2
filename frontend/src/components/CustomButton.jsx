export default function CustomButton({ children, color = "red", title = "No title", onClick = () => { } }) {

    return (
        <button onClick={onClick} style={{ backgroundColor: color }} >
            {title}
            {children}
            </button>
    )

}