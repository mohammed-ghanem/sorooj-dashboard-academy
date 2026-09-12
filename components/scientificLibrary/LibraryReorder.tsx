"use client";

import { BookOpen, Library } from "lucide-react";

import ModuleReorder from "@/components/swapOrder/ModuleReorder";
import { useGetBookCategoriesQuery } from "@/store/bookCategories/bookCategoriesApi";
import { useGetBooksQuery } from "@/store/books/booksApi";
import TranslateHook from "@/translate/TranslateHook";
import type { ModuleReorderConfig } from "@/constants/reorderModules";
import type { IBook } from "@/types/book";

export default function LibraryReorder() {
  const translate = TranslateHook();
  const sidebar = translate?.sidebar;

  const config: ModuleReorderConfig = {
    defaultTabKey: "categories",
    tabs: [
      {
        key: "categories",
        label: sidebar?.bookCategories ?? "Categories",
        icon: Library,
        swapType: "book_categories",
        hintKey: "categoriesHint",
        useGetListQuery: useGetBookCategoriesQuery,
        getLabel: (item) => item.name,
      },
      {
        key: "books",
        label: sidebar?.books ?? "Books",
        icon: BookOpen,
        swapType: "books",
        hintKey: "booksHint",
        useGetListQuery: useGetBooksQuery,
        getLabel: (item) => item.title,
        groupBy: {
          groupTitle: sidebar?.bookCategories ?? "Categories",
          getParentId: (item: IBook) => item.category_id ?? item.category?.id,
          getParentLabel: (item: IBook) => item.category?.name,
        },
      },
    ],
  };

  return <ModuleReorder config={config} />;
}
