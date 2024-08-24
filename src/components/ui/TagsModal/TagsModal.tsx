import React, { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleModal } from "../../../redux/modals";
import { addTagToPage, removeTagFromPage } from "../../../redux/pages";
import { addTagToFolder, removeTagFromFolder } from "../../../redux/folders";
import Overlay from "../Overlay/Overlay";
import ColorPicker from "../ColorPicker/ColorPicker";
import { ItemState, ColorState, TagState, PageState, FolderState } from "../../../types";
import { RootState } from "../../../redux/store";
import "./TagsModal.css";
import { getApiUrl } from "../../../utils/getUrl";

const TagsModal = () => {
  const tagsModalRef = useRef<HTMLDivElement>(null);
  const pages = useSelector((state: RootState) => state.pages);
  const folders = useSelector((state: RootState) => state.folders);
  const tags = useSelector((state: RootState) => state.tags);

  const dispatch = useDispatch();

  const [tagSearchValue, setTagSearchValue] = useState("");
  const [tagColor, setTagColor] = useState<ColorState | null>(null);

  const selectedItem = pages.selected || folders.selected;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        !(e.target as HTMLDivElement).classList.contains("add-tags") &&
        !(tagsModalRef.current as HTMLDivElement).contains(e.target as HTMLElement)
      ) {
        dispatch(toggleModal("tagsModal"));
      }
    }

    window.addEventListener("click", handler);

    return () => window.removeEventListener("click", handler);
  });

  async function handleTagInputSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (tagSearchValue === "") return;

    try {
      const response = await fetch(`${getApiUrl()}/tags/new/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
        body: JSON.stringify({
          name: tagSearchValue.trim(),
          color: tagColor,
          isForItem: true, // TODO - Change this once i can add tags without being on a page/folder
          item: selectedItem,
        }),
      });

      if (response.status !== 200) throw response.statusText;

      const data = await response.json();

      if (!data) throw "There was an issue parsing /tags/new response";

      setTagSearchValue("");
    } catch (e) {
      if (typeof e === "string") {
        console.error(e);
      } else if (e instanceof Error) {
        console.error("ERROR: " + e.message);
      }
    }
  }

  function handleColorChange(color: ColorState) {
    setTagColor(color);
  }

  async function handleTagClick(item: FolderState | PageState, tag: TagState) {
    try {
      const response = await fetch(`${getApiUrl()}/tags/tag-item/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "http://localhost:3000",
        },
        body: JSON.stringify({
          tag,
          item,
          toggleState: item.TAGS.includes(tag.id) ? 0 : 1,
        }),
      });

      if (response.status !== 200) throw response.statusText;

      const data = await response.json();

      if (!data) throw "There was an issue parsing /tags/tag-item response";

      if (item.is_page) {
        if (item.TAGS.includes(tag.id)) {
          dispatch(removeTagFromPage({ item, tag }));
        } else {
          dispatch(addTagToPage({ item, tag }));
        }
      } else {
        let allChildPages: Array<PageState> = [];

        function getChildren(folderIdToCheck: number | null) {
          const childPages = pages.list.filter(
            (page: PageState) => page.folder_id === folderIdToCheck
          );

          allChildPages.push(...childPages);

          const childrenFolders = folders.list
            .filter((folder: FolderState) => folder.parent_folder_id === folderIdToCheck)
            .map((folder: FolderState) => folder.id);

          if (childrenFolders.length === 0) return;

          childrenFolders.forEach((folderId: number) => getChildren(folderId));
        }

        getChildren(item.id);

        if (item.TAGS.includes(tag.id)) {
          dispatch(removeTagFromFolder({ item, tag }));

          if (allChildPages.length > 0) {
            allChildPages.forEach((page) => {
              dispatch(removeTagFromPage({ item: page, tag }));
            });
          }
        } else {
          dispatch(addTagToFolder({ item, tag }));

          if (allChildPages.length > 0) {
            allChildPages.forEach((page) => {
              dispatch(addTagToPage({ item: page, tag }));
            });
          }
        }
      }
    } catch (e) {
      if (typeof e === "string") {
        console.error(e);
      } else if (e instanceof Error) {
        console.error("ERROR: " + e.message);
      }
    }
  }

  if (!selectedItem) return <p>No selected item found</p>;

  return (
    <>
      <div className="tags-modal" ref={tagsModalRef}>
        <p className="heading">
          Add tag(s) to {selectedItem.is_page && "page"} '{selectedItem.name}'
          {!selectedItem.is_page && " and it's contents"}.
        </p>
        <form onSubmit={handleTagInputSubmit}>
          <input
            value={tagSearchValue}
            onChange={(e) => setTagSearchValue(e.target.value)}
            placeholder="Type to search or add a tag"
            autoComplete="off"
          />
          <ColorPicker
            onColorSelect={handleColorChange}
            selectedColor={tagColor}
            showColorCode={false}
          />
        </form>
        {tagSearchValue && !tags.list.find((tag) => tag.name === tagSearchValue) && (
          <button className="tag-button" onClick={(e) => console.error("nothing else happens")}>
            <span
              className="color-span"
              style={{ backgroundColor: tagColor?.COLOR_CODE }}
            >
              &nbsp;
            </span>
            {tagSearchValue}
          </button>
        )}
        {tags.list
          ?.filter((tag: TagState) => tag.name.includes(tagSearchValue))
          .map((tag: TagState, index: number) => {
            return (
              <button
                className={`tag-button ${
                  selectedItem?.TAGS?.includes(tag.id) ? "added" : ""
                }`}
                onClick={(e) => handleTagClick(selectedItem, tag)}
                key={index}
              >
                {" "}
                <span className="color-span" style={{ backgroundColor: tag.COLOR_CODE }}>
                  &nbsp;
                </span>{" "}
                <p>{tag.name}</p>
              </button>
            );
          })}
      </div>
      <Overlay />
    </>
  );
};

export default TagsModal;
