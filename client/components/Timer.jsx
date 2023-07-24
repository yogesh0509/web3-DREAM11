export default function Timer(props) {
    return (
            <div class="flex mt-0 mb-8 mx-5">
                <div class="flex items-center justify-center">
                    {props.minutes < 10
                        ? <span class="text-6xl text-white">0{props.minutes}</span>
                        : <span class="text-6xl text-white">{props.minutes}</span>}
                    <span class="text-6xl text-white">:</span>
                    {props.seconds < 10
                        ? <span class="text-6xl text-white">0{props.seconds} </span>
                        : <span class="text-6xl text-white">{props.seconds} </span>}
                </div>
            </div>
    )
}