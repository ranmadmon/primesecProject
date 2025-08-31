import React from 'react';
import {Button, Stack, Typography} from "@mui/material";
import ErrorIcon from '@mui/icons-material/Error';
import {Link} from "react-router-dom";


function ErrorPage() {
    return (
        <Stack
            textAlign="center"
            padding={16}
            direction="column"
            spacing={4}
        >

            <Typography color='error'
                        variant="h1"
            >
                <ErrorIcon sx={{width: 90, height: 90}}/> Error 404
            </Typography>

            <Typography color='error'
                        variant="h4"
            >
                Not Found
            </Typography>

            <Link to={"/"}>
                <Button
                    variant={'contained'}
                    color={'error'}
                    sx={{textTransform: 'inherit'}}
                >
                    Go Back
                </Button>

            </Link>
        </Stack>

    );
}

export default ErrorPage;