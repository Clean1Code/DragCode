import { useEffect } from "react";

function WithPalleteBlock(WrappedComponent, AddNewBlock) {
    return function FinalPalleteBlock(props) {

        function handleMouseDown(event) {
            const block = props.domRef.current;
            if (!block) return;

            AddNewBlock();
        }

        useEffect(() => {
            const block = props.domRef.current;
            if (!block) return;

            block.addEventListener("mousedown", handleMouseDown);

            return () => {
                block.removeEventListener("mousedown", handleMouseDown);
            };
        }, []);

        return <WrappedComponent {...props} />;
    };
}

export default WithPalleteBlock;
