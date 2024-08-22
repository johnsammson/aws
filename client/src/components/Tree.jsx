const FileTreeNode = ({ filename, nodes, onSelect, path }) => {
    const isDir = !!nodes;
  return (
    <div onClick={(e) =>{
        e.stopPropagation();
        if(isDir) return;
        onSelect(path)

    }} style={{marginLeft:"8px"}}>
      <p className={isDir ? "" : "file-node"} style={{color: isDir ? "" : "orange"}}>{filename}</p>

      {nodes && (
        <ul>
          {Object.keys(nodes).map((child) => (
            <li key={child}>
              <FileTreeNode path={path + "/" + child}filename={child} onSelect={onSelect} nodes={nodes[child]} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
const FileTree = ({tree, onSelect}) => {
    
    
    return (
        <div>
            <FileTreeNode onSelect={onSelect} filename="/" nodes={tree} path="" />
        </div>
    )
};
export default FileTree;