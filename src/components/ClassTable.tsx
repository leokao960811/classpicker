import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { Course } from './ClassList';
import PaginationItems from './PaginationItems';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGlobalContext } from '@/context/GlobalContext';
import { createSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';

interface ClassTableProps {
  courses: Course[];
  currentPage?: number;
  totalPages?: number;
  handlePageChange?: (pageNumber: number) => void;
  enableAddClasses?: boolean;
}

export const ClassTable: React.FC<ClassTableProps> = ({
  courses,
  currentPage,
  totalPages,
  handlePageChange,
  enableAddClasses
}) => {
  const navigate = useNavigate();
  const { selectedClasses, setSelectedClasses, courseTags, setCourseTags } = useGlobalContext();
  const [actionClasses, setActionClasses] = useState<Course[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleCourseSelect = (course: Course) => {
    if (actionClasses.includes(course)) {
      setActionClasses(actionClasses.filter((c) => c !== course));
    } else {
      setActionClasses([...actionClasses, course]);
    }
  };

  const handleAddSelectedCourses = () => {
    console.log('Adding selected courses:', actionClasses);

    // Persist selected courses to localStorage
    localStorage.setItem('selectedCourses', JSON.stringify([...selectedClasses, ...actionClasses]));
    setSelectedClasses([...selectedClasses, ...actionClasses]);
  };

  const handleDeleteSelectedCourses = () => {
    console.log('Deleting selected courses:', actionClasses);

    // Remove selected courses from global context
    const updatedSelectedClasses = selectedClasses.filter((c) => !actionClasses.includes(c));
    localStorage.setItem('selectedCourses', JSON.stringify(updatedSelectedClasses));
    setSelectedClasses(updatedSelectedClasses);

    // Clear current selection
    setActionClasses([]);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    if (tagInput.length < 1 || tagInput.length > 20) {
      return;
    }

    const newTags = { ...courseTags };
    actionClasses.forEach(course => {
      const courseId = course.開課序號.toString();
      if (!newTags[courseId]) {
        newTags[courseId] = [];
      }
      if (!newTags[courseId].includes(tagInput)) {
        newTags[courseId] = [...newTags[courseId], tagInput];
      }
    });

    setCourseTags(newTags);
    localStorage.setItem('courseTags', JSON.stringify(newTags));
    setTagInput('');
  };

  const handleRemoveTag = (courseId: string, tagToRemove: string) => {
    const newTags = { ...courseTags };
    if (newTags[courseId]) {
      newTags[courseId] = newTags[courseId].filter(tag => tag !== tagToRemove);
      if (newTags[courseId].length === 0) {
        delete newTags[courseId];
      }
      setCourseTags(newTags);
      localStorage.setItem('courseTags', JSON.stringify(newTags));
    }
  };

  useEffect(() => {
    setActionClasses([]);
  }, [currentPage, courses]);

  return (
    <>
      <Table className="w-full border rounded">
        <TableHeader>
          <TableRow>
            <TableHead>
              <input
                type="checkbox"
                checked={actionClasses.length === courses.length && actionClasses.length !== 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setActionClasses(courses);
                  } else {
                    setActionClasses([]);
                  }
                }}
              />
            </TableHead>
            <TableHead>開課序號</TableHead>
            <TableHead>課程名稱</TableHead>
            <TableHead>系所</TableHead>
            <TableHead>學分</TableHead>
            <TableHead>教師</TableHead>
            <TableHead>時間地點</TableHead>
            {!enableAddClasses && (<TableHead>標籤</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.開課序號}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={actionClasses.includes(course)}
                  onChange={() => handleCourseSelect(course)}
                />
              </TableCell>
              <TableCell>
                <span className='underline cursor-pointer' onClick={() => navigate({
                  pathname: "/coursedetail",
                  search: createSearchParams({
                    id: course.開課序號.toString()
                  }).toString()
                })}>
                  {course.開課序號}
                </span>
              </TableCell>
              <TableCell>
                <span className='text-base'>{course.中文課程名稱.replace(/(?:\[.*?\]|\(.*?\))/g, '')}</span><br />
                <span className='text-xs text-gray-400'>{course.英文課程名稱.replace(/(?:\[.*?\]|\(.*?\))/g, '')}</span>
              </TableCell>
              <TableCell>{course.系所}</TableCell>
              <TableCell>{course.學分}</TableCell>
              <TableCell>{course.教師}</TableCell>
              <TableCell>{course.地點時間}</TableCell>
              {!enableAddClasses && (
              <TableCell>
                {courseTags[course.開課序號.toString()]?.map((tag, index) => (
                  <span key={index} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(course.開課序號.toString(), tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end mt-4 space-x-4">
        {enableAddClasses ? (
          <Button
            onClick={handleAddSelectedCourses}
            disabled={actionClasses.length === 0}
          >
            加入課表
          </Button>
        ) : (
          <>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="輸入標籤"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-32"
                onKeyDown={(e) => {
                  if (e.key.toLocaleLowerCase() === 'enter' && tagInput.trim() && actionClasses.length > 0) {
                    handleAddTag();
                  }
                }}
              />
              <Button
                onClick={handleAddTag}
                disabled={actionClasses.length === 0 || !tagInput.trim()}
              >
                新增標籤
              </Button>
              <Button
                onClick={handleDeleteSelectedCourses}
                disabled={actionClasses.length === 0}
                className="bg-red-500 hover:bg-red-600"
              >
                刪除課程
              </Button>
            </div>
          </>
        )}
      </div>

      {totalPages > 1 && (
        <PaginationItems
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
};
