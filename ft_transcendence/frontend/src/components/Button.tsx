type ButtonProps = 
{
  text: string;
};

function Button({ text }: ButtonProps) 
{
  return (
    <button type="submit">
      {text}
    </button>
  );
}

export default Button;