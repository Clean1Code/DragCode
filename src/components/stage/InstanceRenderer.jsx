import { useSpriteStore } from "../../data/states/SpriteStore";
function InstanceRenderer({ instanceID }) {

    const instance = useSpriteStore(
        state => state.instances[instanceID]
    );

    if (!instance) return null;

    const x = ((instance.xpos + 240) / 480) * 100;
    const y = ((instance.ypos + 180) / 360) * 100;

    return (
        <img
            src={instance.src}

            className="absolute"

            style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `translate(-50%, -50%) rotate(${instance.rotation}deg)`
            }}
        />
    );
}

export {InstanceRenderer};