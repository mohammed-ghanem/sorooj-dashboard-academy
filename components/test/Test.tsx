import React from 'react'
import CarouselComponent from '../carousel/CarouselComponent'



const CircelSlider = () => {

  const items = [
    { id: 1, title: "men" },
    { id: 2, title: "women" },
    { id: 3, title: "kids" },
    { id: 4, title: "accessories" },
    { id: 5, title: "electronics" },
    { id: 6, title: "jewelery" },
    { id: 7, title: "games" },
  ];

  const categories = items.map((item) => (
    <div key={item.id}
      className='rounded-4xl'
    >
      <p className=''>{item.title}</p>
    </div>
  ));

  return (
    <div className=' container wx-[80%] mx-auto'>
      <div className="px-5 py-0.5 ">
        <CarouselComponent
          items={categories}
          height="h-[200px]"
          itemsPerView={5}
          autoplay={true}
          useCardWrapper={true}
          cardClassName="bg-white shadow-none border-none"
          cardContentClassName="flex flex-col items-center justify-center gap-2 rounded-[50%] bg-[red] h-[200px] w-[200px] m-auto [box-shadow:1px_1px_10px_#ddd]"
        />
      </div>
    </div>
  )
}

export default CircelSlider