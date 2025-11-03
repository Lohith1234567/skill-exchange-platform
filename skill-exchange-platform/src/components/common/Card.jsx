const Card = ({ children, className = '', hover = false, ...props }) => {
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow' : '';
  
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
