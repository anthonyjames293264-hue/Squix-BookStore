export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"){document.documentElement.classList.remove("dark")}else{document.documentElement.classList.add("dark")}}catch(e){}})()`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
