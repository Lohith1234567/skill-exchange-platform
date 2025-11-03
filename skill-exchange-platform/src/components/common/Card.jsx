const Card = ({ children, className = '', hover = false, ...props }) => {
  // Use unified design system
  const hoverClass = hover ? 'card-hover' : '';
  
  return (
    <div
      className={`card ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
