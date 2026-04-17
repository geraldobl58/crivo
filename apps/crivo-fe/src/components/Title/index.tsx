type TitleProps = {
  id?: string;
  title: string;
  description: string;
};

export const Title = ({ id, title, description }: TitleProps) => {
  return (
    <div
      id={id}
      className="w-full flex flex-col items-center max-w-7xl mx-auto px-4 py-18"
    >
      <h1 className="text-5xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="mt-4 text-lg text-gray-400">{description}</p>
    </div>
  );
};
