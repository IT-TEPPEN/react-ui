import { cleanup, fireEvent, render } from "@testing-library/react";
import { FileUploader } from "./component";

afterEach(cleanup);

const file = (name: string, type = "") => new File(["x"], name, { type });

function setup(props: Partial<React.ComponentProps<typeof FileUploader>>) {
  const onFilesAdded = jest.fn();
  const onFilesRejected = jest.fn();
  const { container } = render(
    <FileUploader
      onFilesAdded={onFilesAdded}
      onFilesRejected={onFilesRejected}
      {...props}
    />
  );
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;

  const select = (files: File[]) => {
    fireEvent.change(input, { target: { files } });
  };
  const names = (mock: jest.Mock) =>
    mock.mock.calls.flatMap(([files]: [File[]]) => files.map((f) => f.name));

  return { input, select, onFilesAdded, onFilesRejected, names };
}

describe("FileUploader validation", () => {
  test("with only allowedExtensions, other types are rejected", () => {
    const { select, onFilesAdded, onFilesRejected, names } = setup({
      allowedExtensions: [".pdf"],
    });

    select([
      file("a.pdf", "application/pdf"),
      file("b.png", "image/png"),
      file("c.txt", "text/plain"),
    ]);

    expect(names(onFilesAdded)).toEqual(["a.pdf"]);
    expect(names(onFilesRejected)).toEqual(["b.png", "c.txt"]);
  });

  test("with only acceptedFileTypes, other extensions are rejected", () => {
    const { select, onFilesAdded, names } = setup({
      acceptedFileTypes: ["image/*"],
    });

    select([file("a.png", "image/png"), file("b.pdf", "application/pdf")]);

    expect(names(onFilesAdded)).toEqual(["a.png"]);
  });

  test("extensions match without the leading dot and ignore case", () => {
    const { select, onFilesAdded, names } = setup({
      allowedExtensions: ["pdf"],
    });

    select([file("A.PDF"), file("pdf"), file("x.pdf.exe")]);

    expect(names(onFilesAdded)).toEqual(["A.PDF"]);
  });

  test("with neither list, the defaults are used as before", () => {
    const { select, onFilesAdded, onFilesRejected, names } = setup({});

    select([
      file("mail.msg"),
      file("photo.gif", "image/gif"),
      file("app.exe", "application/x-msdownload"),
    ]);

    expect(names(onFilesAdded)).toEqual(["mail.msg", "photo.gif"]);
    expect(names(onFilesRejected)).toEqual(["app.exe"]);
  });

  test("the file dialog lists both extensions and MIME types", () => {
    const { input } = setup({
      allowedExtensions: [".msg", "pdf"],
      acceptedFileTypes: ["image/*"],
    });

    expect(input.accept).toBe(".msg,.pdf,image/*");
  });

  test("the same file can be picked again", () => {
    const { input, select, onFilesAdded } = setup({});

    select([file("a.pdf", "application/pdf")]);
    expect(input.value).toBe("");
    select([file("a.pdf", "application/pdf")]);

    expect(onFilesAdded).toHaveBeenCalledTimes(2);
  });
});
