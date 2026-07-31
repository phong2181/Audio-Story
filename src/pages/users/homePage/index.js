import { memo } from 'react';
import "./style.scss";
import CourseGrid from './PostList/postlist';

const HomePage = () => {
    return (    
        <>
            <CourseGrid />
        </>
    );
}

export default memo(HomePage);
