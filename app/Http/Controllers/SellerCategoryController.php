<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Models\Category;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class SellerCategoryController extends Controller
{
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::create($request->validated());

        return to_route('seller.catalog.index');
    }

    public function update(StoreCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        return to_route('seller.catalog.index');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            throw ValidationException::withMessages(['category' => 'Kategori masih digunakan produk. Nonaktifkan kategori atau pindahkan produknya terlebih dahulu.']);
        }

        try {
            $category->delete();
        } catch (QueryException $exception) {
            if (! $category->products()->exists()) {
                throw $exception;
            }

            throw ValidationException::withMessages(['category' => 'Kategori masih digunakan produk.']);
        }

        return to_route('seller.catalog.index');
    }
}
