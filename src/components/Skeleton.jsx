import "./Skeleton.css";

const Skeleton = ({ width, height, variant = "react" }) => {
	const style = { width, height };

	return <span className={`skeleton ${variant}`} style={style}></span>;
};

export default Skeleton;
