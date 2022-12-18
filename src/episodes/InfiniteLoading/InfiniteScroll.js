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

const Beer = ({ beer: { image_url, name, abv } }) => {
  return (
    <BeerWrapper>
      <img style={{ height: "300px" }} src={image_url} alt={name} />
      <div>
        <p>{name.length > 12 ? trimName(name) : name}</p>
        <p>{abv}</p>
      </div>
    </BeerWrapper>
  );
};

const InfiniteScroll = () => {
  const [beers, setBeers] = useState([]);
  const [page, setPage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchBeers();
      //   setBeers([...res.items]);
      setBeers(res.items);
      setPage(res.page);
    };

    fetchData();
  }, []);

  const getMoreBeers = async () => {
    const res = await fetchBeers(page.next);
    setBeers([...beers, ...res.items]);
    setPage(res.page);
  };

  return (
    <>
      <button onClick={getMoreBeers}>load more</button>
      <Wrapper>
        {beers.map((beer, i) => (
          <Beer key={i} beer={beer} />
        ))}
      </Wrapper>
    </>
  );
};

export default InfiniteScroll;
