import { useSelector, useDispatch } from "react-redux";
import { selectPage } from "../../../redux/pages";
import { setSearchValue } from "../../../redux/sidebar";
import PageIcon from "../Icons/PageIcon";
import { PageState } from "../../../types";
import { RootState } from "../../../redux/store";
import "./PageSearch.css";

const PageSearch = () => {
  const sidebar = useSelector((state: RootState) => state.sidebar);
  const pages = useSelector((state: RootState) => state.pages);
  const dispatch = useDispatch();

  function handlePageClick(page: PageState) {
    dispatch(selectPage(page));
  }
  let searchResults = pages.list.filter(
    (page: PageState) => page.eff_status && page.body.includes(sidebar.searchValue)
  );

  return (
    <div className="page-search">
      <form>
        <input
          placeholder="Search pages"
          value={sidebar.searchValue}
          onChange={(e) => dispatch(setSearchValue((e.target as HTMLInputElement).value))}
          autoComplete="off"
        />
      </form>
      {searchResults.length === 0 && (
        <p className="no-results-found">No results found.</p>
      )}
      {sidebar.searchValue !== "" &&
        searchResults.map((page, i) => {
          let body = page.body;

          type MatchingCharacter = {
            startingIndex: number;
            index: number;
            char: string;
          };

          let startingMatchIndexes: Array<{
            startingIndex: number;
            matchingCharacters: Array<MatchingCharacter>;
          }> = [];

          function findStartingMatchIndex(string: string, lastMatchingIndex: number) {
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

            const matchingCharacters = [
              ...string.slice(
                matchingStartingIndex,
                matchingStartingIndex + sidebar.searchValue.length
              ),
            ].map((char, index) => {
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

            findStartingMatchIndex(string, matchingStartingIndex + 1);
          }

          if (sidebar.searchValue !== "") findStartingMatchIndex(body, 0);

          return (
            <div
              draggable="true"
              className={`page-container hoverable ${page.selected ? "selected" : ""}`}
              key={i}
              onClick={() => handlePageClick(page)}
            >
              <div className="tier-block-and-name">
                <div key={i} className="tier-block">
                  &nbsp;
                </div>
                <div className="name-and-caret">
                  <div className="caret-container">
                    &nbsp; <PageIcon />
                  </div>
                  <p>{page.name}</p>
                </div>
              </div>
              <div className="matching-body-examples">
                {startingMatchIndexes.map((match, i) => {
                  const startingIndex = match.startingIndex;
                  const slicedBody = [...body].slice(startingIndex, startingIndex + 35);
                  const slicedBodyLength = slicedBody.length;
                  const bodyLength = body.length;

                  return (
                    <p key={i}>
                      {slicedBody.map((char, charIndex) => {
                        const compedBodyIndex = bodyLength - slicedBodyLength + charIndex;

                        let matching = false;

                        if (compedBodyIndex === match.startingIndex) matching = true;
    
                        return (
                          <span className={matching ? "matching" : ""} key={charIndex}>
                            {char}
                          </span>
                        );
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
