import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const BackButton = ({ fallback, className }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(fallback))}
      className={className} // <-- forward className here
    >
      <FaArrowLeft/>
    </button>
  );
};

export default BackButton;
