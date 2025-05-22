import { Calendar, Clock, AlertTriangle, Monitor, Globe, Smartphone, Tag, FileText, CheckCircle, Link, GitPullRequest } from "lucide-react";
import { Bug as BugType } from "@/types/bug";

interface BugViewFormProps {
  task: BugType;
}

const BugViewForm = ({ task }: BugViewFormProps) => {
  return (
    <>
      {/* Title */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Title:</p>
        <p className="text-black text-lg">{task.title}</p>
      </div>

      {/* Description */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Description:</p>
        <p className="text-black text-lg">{task.description}</p>
      </div>

      {/* Priority */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Priority:</p>
        <p className="text-black text-lg">{task.priority}</p>
      </div>

      {/* Bug Status */}
      {"bug_status" in task && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Bug Status:</p>
          <p className="text-black text-lg">{task.bug_status}</p>
        </div>
      )}

      {/* Severity */}
      {"severity" in task && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Severity:</p>
          <p className="text-black text-lg">{task.severity}</p>
        </div>
      )}

      {/* Bug Type */}
      {"type" in task && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Bug Type:</p>
          <p className="text-black text-lg">{task.type}</p>
        </div>
      )}

      {/* Visible to Customers Warning */}
      {task.visibleToCustomers && (
        <div className="bg-red-50 p-3 rounded-lg shadow-sm border border-red-200">
          <p className="text-lg text-red-600 font-semibold flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Bug is visible to customers
          </p>
        </div>
      )}

      {/* Environment Details */}
      {"environment" in task && task.environment && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Environment:</p>
          <div className="grid grid-cols-1 gap-1 text-xs">
            {task.environment.os && (
              <div className="flex items-center">
                <Monitor className="h-3 w-3 mr-2 text-gray-500" />
                <span className="font-medium text-lg">OS:</span> {task.environment.os}
              </div>
            )}
            {task.environment.browser && (
              <div className="flex items-center">
                <Globe className="h-3 w-3 mr-2 text-gray-500" />
                <span className="font-medium text-lg">Browser:</span> {task.environment.browser}
              </div>
            )}
            {task.environment.device && (
              <div className="flex items-center">
                <Smartphone className="h-3 w-3 mr-2 text-gray-500" />
                <span className="font-medium text-lg">Device:</span> {task.environment.device}
              </div>
            )}
            {task.environment.version && (
              <div className="flex items-center">
                <Tag className="h-3 w-3 mr-2 text-gray-500" />
                <span className="font-medium text-lg">Version:</span> {task.environment.version}
              </div>
            )}
          </div>
          {task.environment.otherDetails && (
            <div className="mt-2 text-xs flex items-start">
              <FileText className="h-3 w-3 mr-2 text-gray-500 mt-0.5" />
              <div>
                <span className="font-medium text-lg">Notes:</span> {task.environment.otherDetails}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Affected Components */}
      {"affectedComponents" in task && task.affectedComponents && task.affectedComponents.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Affected Components:</p>
          <div className="flex flex-wrap gap-1">
            {task.affectedComponents.map((component, idx) => (
              <span key={idx} className="bg-gray-100 px-2 py-1 rounded-md text-xs">
                {component}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Steps to Reproduce */}
      {"stepsToReproduce" in task && task.stepsToReproduce && task.stepsToReproduce.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Steps to Reproduce:</p>
          <ol className="list-decimal pl-4 space-y-1">
            {task.stepsToReproduce.map((step, index) => (
              <li key={index} className="text-xs">{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Resolution Details */}
      {"resolution" in task && task.resolution && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-2 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Resolution:
          </p>
          <div className="space-y-1 text-xs">
            <div><span className="font-medium text-lg">Status:</span> {task.resolution.status}</div>
            <div><span className="font-medium text-lg">Description:</span> {task.resolution.description}</div>
            
            {task.resolution.commitId && (
              <div className="flex items-center">
                <Link className="h-3 w-3 mr-1 text-[#4A2B4A]" />
                <span className="font-medium text-lg">Commit:</span> {task.resolution.commitId}
              </div>
            )}
            
            {task.resolution.pullRequestUrl && (
              <div className="flex items-center">
                <GitPullRequest className="h-3 w-3 mr-1 text-[#4A2B4A]" />
                <span className="font-medium text-lg">PR:</span>{" "}
                <a href={task.resolution.pullRequestUrl} className="text-blue-600 underline ml-1 text-xs">
                  View PR
                </a>
              </div>
            )}
            
            <div>
              <span className="font-medium">Resolved by:</span> {task.resolution.resolvedBy}
            </div>
            
            {task.resolution.resolvedAt && (
              <div>
                <span className="font-medium text-lg">Resolved at:</span>{" "}
                {new Date(task.resolution.resolvedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BugViewForm;