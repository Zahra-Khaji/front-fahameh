import ProjectHeader from "../features/freelnacer/projects/ProjectsHeader";
import ProjectTable from "../features/freelnacer/projects/ProjectsTable";
import ProjectStatusTable from "../features/freelnacer/projects/ProjectStatusTable"

function SubmittedProjects() {
  return (
    <div>
      <ProjectHeader />
      <ProjectStatusTable/>
      {/* <ProjectTable /> */}
      
    </div>
  );
}
export default SubmittedProjects;
