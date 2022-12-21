import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSearchValue } from "../../../redux/sidebar";
import PageIcon from "../Icons/PageIcon";
import "./PageSearch.css";

const PageSearch = () => {
  const sidebar = useSelector((state) => state.sidebar);
  const pages = useSelector((state) => state.pages);
  const dispatch = useDispatch();

  function handleSearchInputChange(e) {
    dispatch(setSearchValue(e.target.value));
  }

  let searchResults = pages.list.filter(
    (page) => page.EFF_STATUS && page.BODY.includes(sidebar.searchValue)
  );

  return (
    <div className="page-search">
      <form>
        <input
          placeholder="Search"
          value={sidebar.searchValue}
          onChange={handleSearchInputChange}
        />
      </form>
      {sidebar.searchValue !== "" &&
        searchResults.map((page) => {
          let body = page.BODY;

          let startingMatchIndexes = [];

          function findStartingMatchIndex(string, lastMatchingIndex) {
            const matchingStartingIndex = string.indexOf(
              sidebar.searchValue,
              lastMatchingIndex
            );

            if (matchingStartingIndex < 0) return;

            if (lastMatchingIndex + 1 >= string.length) return;

            const indexAlreadyInArray = startingMatchIndexes.find(
              (match) => match.startingIndex === matchingStartingIndex
            );

            if (indexAlreadyInArray) return;

            let matchingCharacters = [
              ...string.slice(
                matchingStartingIndex,
                matchingStartingIndex + sidebar.searchValue.length
              ),
            ];

            matchingCharacters = matchingCharacters.map((char, index) => {
              return {
                startingIndex: matchingStartingIndex,
                index: matchingStartingIndex + index,
                char,
              };
            });

            startingMatchIndexes.push({
              startingIndex: matchingStartingIndex,
              matchingCharacters,
            });

            // startingMatchIndexes.push(...matchingCharacters);

            findStartingMatchIndex(string, lastMatchingIndex + 1);
          }

          if (sidebar.searchValue !== "") findStartingMatchIndex(body, 0);

          return (
            <div draggable="true" className="page-container hoverable">
              <div className="name-and-caret">
                <div className="caret-container">
                  &nbsp; <PageIcon />
                </div>
                <p>{page.NAME}</p>
              </div>
              <div className="matching-body-examples">
                {startingMatchIndexes.map((match, i) => {
                  console.log(match);
                  return (
                    <p key={i}>
                      {[...body].map((char, charIndex) => {
                        let matching = false;

                        if (charIndex === match.index) matching = true;

                        let matchingCharacter = match.matchingCharacters[charIndex - match.startingIndex]

                        if (matchingCharacter?.index == charIndex) {
                          matching = true
                        }

                        return <span className={matching ? "matching" : ""}>{char}</span>;
                      })}
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
