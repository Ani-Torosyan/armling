type Props = {
    title: string;
};

export const Header = ({ title }: Props) => {
    return (
        <div className="sticky top-0 bg-customMid pb-3 lg:pt-[28px] lg:mt-[-28px] flex items-center justify-center border-b-2 border-customShade mb-2 text-customDark lg:z-50">
            <h1 className="font-bold text-lg ">
                {title}
            </h1>
        </div>
    );
};