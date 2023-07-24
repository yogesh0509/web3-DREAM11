import React from "react";

const Wrapper = ({
    children,
    className,
}) => {
    return (
        <div
            className={`w-full max-w-[1380px] px-7 font-proxima mx-auto ${className}`}
        >
            {children}
        </div>
    );
};

export default Wrapper;
