import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AdminCourseEditor from './AdminCourseEditor';

export default function AdminCourse() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'students') {
      navigate('/appointments?view=courses&scroll=courses', { replace: true });
    }
  }, [searchParams, navigate]);

  return <AdminCourseEditor />;
}
