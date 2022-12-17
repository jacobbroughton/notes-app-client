import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import PageIcon from "../Icons/PageIcon";
import "./PageSearch.css";

const PageSearch = () => {
  const [searchValue, setSearchValue] = useState("");

  const pages = useSelector((state) => state.pages);

  function handleSearchInputChange(e) {
    setSearchValue(e.target.value);
  }

  let searchResults = pages.list.filter((page) => page.BODY.includes(searchValue));

  return (
    <div className="page-search">
      <form>
        <input
          placeholder="Search"
          value={searchValue}
          onChange={handleSearchInputChange}
        />
      </form>
      {searchValue !== "" &&
        searchResults.map((page) => {
          // Get the start and end index (2nd param of indexOf is the index to start at)
          // After the first one, look for more and push to an array to display similar to vs code

          let matchingIndexes = [];
          let idCounter = 0;

          function checkForMatch(string, lastMatchingIndex) {
            const matchingIndex = string.indexOf(searchValue, lastMatchingIndex);

            if (matchingIndex < 0) return;

            if (lastMatchingIndex + 1 >= string.length) return;

            console.log(matchingIndexes, matchingIndex);

            const indexAlreadyInArray = matchingIndexes.find(
              (index) => index.matchingIndex === matchingIndex
            );

            if (!indexAlreadyInArray) {
              matchingIndexes.push({
                id: idCounter,
                matchingIndex,
                char: string[matchingIndex],
              });
              idCounter += 1;
            }

            checkForMatch(string, lastMatchingIndex + 1);
          }

          if (searchValue !== "") {
            checkForMatch(page.BODY, 0);
          }

          console.log({ searchValue, body: page.BODY, matchingIndexes });

          return (
            <div draggable="true" className="page-container hoverable">
              <div className="name-and-caret">
                <div className="caret-container">
                  &nbsp; <PageIcon />
                </div>
                <p>{page.NAME}</p>
              </div>
              <div className="matching-body-examples">
                {matchingIndexes.map((matchingIndex, index) => {
                  let startIndex;
                  let endIndex;
                  let diffBetweenFirstMatchAndCurrent = 0;

                  if (matchingIndex.matchingIndex - 5 <= 0) {
                    startIndex = 0;
                    endIndex = 5;
                  } else {
                    startIndex = matchingIndex.matchingIndex - 5;
                    endIndex = matchingIndex.matchingIndex + 5;
                  }

                  return (
                    <p>
                      {[...page.BODY]
                        // .filter(
                        //   (letter, index) =>
                        //     index > matchingIndex.matchingIndex - 5 &&
                        //     index < matchingIndex.matchingIndex + 5
                        // )
                        .map((char, index) => {

                          return (
                            <span
                              className={
                                index === matchingIndex.matchingIndex ? "matching" : ""
                              }
                            >
                              {char}
                            </span>
                          );
                        })}{" "}
                      {matchingIndex.matchingIndex}
                    </p>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default PageSearch;
