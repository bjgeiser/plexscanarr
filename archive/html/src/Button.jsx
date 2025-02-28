
function Button(props) {
    const {name, href, handleOnChange} = props;
    return (
        <div space-x-5>
            <button className="btn">Button</button>
        </div>
    );
}

export default Button;