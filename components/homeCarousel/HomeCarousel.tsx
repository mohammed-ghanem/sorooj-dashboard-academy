/* eslint-disable @next/next/no-img-element */
import React from "react";
import CarouselComponent from "../carousel/CarouselComponent";

const HomeCarousel = () => {
    const items = [
        { id: 1, img: "https://www.hamadalhajri.net/Files/settings/banner.png" },
        { id: 2, img: "https://placehold.co/1400x400/000000/FFF" },
        { id: 3, img: "https://placehold.co/1400x400/orange/white" },
    ];

    const slider = items.map((item) => (
        <div key={item.id}>
            <img src={item.img} alt={`Slide ${item.id}`} className="w-full h-full object-cover" />
        </div>
    ));

    return (
        <div className="container w-[80%] mx-auto mt-5">
            <div className="px-5 py-0.5 ">
                <CarouselComponent
                    items={slider}
                    height="h-[100%] md:h-96 lg:h-96"
                    autoplay={false}
                    interval={5000}
                    showArrows={false}
                    showDots={true}
                    itemsPerView={1} // Change to 2, 3, or 4 for different layouts
                />
            </div>
        </div>
    );
};

export default HomeCarousel;
