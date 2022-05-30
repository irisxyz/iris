import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import styled from "styled-components";
import { SEARCH } from "../utils/queries";

const Form = styled.form``

const SearchProfile = styled.input`
    border: none;
    font-size: 1em;
    outline: none;
    font-family: ${(p) => p.theme.font};
    font-weight: 600;
    border-radius: 18px;
    padding: 0px 1em;
    height: 34px;
    box-shadow: 0px 4px 12px rgb(236 176 178 / 50%)
`

function Search() {
    const [searchText, setSearchText] = useState("");
    const [searchProfiles, searchProfilesData] = useLazyQuery(SEARCH);
    
    const handleSearch = (e) => {
        if (!e.target.value) {
            return;
        }
        const text = e.target.value
        setSearchText(text)
    }
    
    useEffect(() => {
        if (!searchText) {
            return;
        }
        
        searchProfiles({
            variables: {
                request: {
                    query: searchText,
                    type: 'PROFILE',
                }
            },
        })
    }, [searchText])
    
    return (
        <>
            <Form>
                <SearchProfile onChange={handleSearch} placeholder={"Search..."} />
            </Form>
            
            {searchProfilesData?.search?.items?.map((profile) => {
                <div>{JSON.stringify(profile)}</div>
            })}

        </>
    )
}

export default Search