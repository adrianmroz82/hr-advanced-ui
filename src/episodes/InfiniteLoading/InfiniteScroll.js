import React, { useState, useEffect, useRef, useCallback } from "react";
import data from "./beers.json";
import * as paginate from "paginatejson";
import styled from "styled-components";

const Wrapper = styled.div`
  display: grid;
  justify-content: center;
  grid-template-columns: 400px 400px;
  grid-template-rows: auto;
  grid-gap: 50px;
`;

const BeerWrapper = styled.div`
  border: 10px solid black;
  width: 100%;
  position: relative;

  img {
    height: 400px;
    object-fit: contain;
  }

  div {
    position: absolute;
    background-color: #ffd121;
    width: 100%;
    left: 0;
    bottom: 0;
    text-align: right;
    padding-right: 20px;
    z-index: -1;
  }
`;

const fetchBeers = (page = 1) => {
  const { items, ...pageInfo } = paginate.paginate(data, page, 6);
  return new Promise((resolve) => setTimeout(() => resolve({ items, page: pageInfo }), 2500));
};

const trimName = (name) => {
  const words = name.split(" ");
  return `${words[0]} ${words[1]}`;
};

const Beer = React.forwardRef(({ beer: { image_url, name, abv } }, ref) => {
  return (
    <BeerWrapper ref={ref}>
      <img style={{ height: "300px" }} src={image_url} alt={name} />
      <div>
        <p>{name.length > 12 ? trimName(name) : name}</p>
        <p>{abv}</p>
      </div>
    </BeerWrapper>
  );
});

const InfiniteScroll = () => {
  const [beers, setBeers] = useState([]);
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastElementRef = useRef(null);
  const observer = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchBeers();
      setBeers([...res.items]);
      setPage(res.page);
    };

    fetchData();
  }, []);

  const getMoreBeers = useCallback(async () => {
    setIsLoading(true);
    if (!page || !page.next) return;
    const res = await fetchBeers(page.next);
    setBeers([...beers, ...res.items]);
    setPage(res.page);
  }, [beers, page]);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          getMoreBeers();
        }
      },
      {
        root: document,
        threshold: 0.5,
        rootMargin: "50px",
      }
    );

    if (lastElementRef.current) {
      console.log(lastElementRef.current);
      observer.current.observe(lastElementRef.current);
    }

    return () => {
      observer.current.disconnect();
    };
  }, [getMoreBeers]);

  return (
    <>
      <button onClick={getMoreBeers}>load more</button>
      <Wrapper>
        {beers.map((beer, i) => {
          if (i === beers.length - 1) return <Beer key={i} beer={beer} ref={lastElementRef} />;
          return <Beer key={i} beer={beer} />;
        })}
      </Wrapper>
      {isLoading && <div>LOADING MORE</div>}
    </>
  );
};

export default InfiniteScroll;
